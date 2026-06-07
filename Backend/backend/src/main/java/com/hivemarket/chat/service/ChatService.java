package com.hivemarket.chat.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hivemarket.chat.dto.ConversationRequest;
import com.hivemarket.chat.dto.ConversationResponse;
import com.hivemarket.chat.dto.MessageResponse;
import com.hivemarket.chat.entity.Conversation;
import com.hivemarket.chat.entity.Message;
import com.hivemarket.chat.repository.ConversationRepository;
import com.hivemarket.chat.repository.MessageRepository;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepo;
    private final MessageRepository      messageRepo;
    private final UserRepository userRepo;

    // ── NOTE ──────────────────────────────────────────────────────────────────
    // `otherUserName` requires a User lookup.  Inject your UserRepository /
    // UserService here and replace the TODO stubs below.
    // Example:
    //   private final UserRepository userRepo;
    //   String name = userRepo.findById(otherId)
    //                         .map(User::getFullName)
    //                         .orElse("Unknown");
    // ──────────────────────────────────────────────────────────────────────────

    // =========================================================================
    // GET CONVERSATIONS  (used by ChatScreen list)
    // =========================================================================

    /**
     * Returns all conversations for a user, split-ready for the
     * Buying / Selling tabs on the frontend.
     *
     * Each ConversationResponse now carries:
     *   - otherUserName  → shown as contact fullName
     *   - otherUserId    → the other participant's UUID
     *   - unreadCount    → drives the per-row unread badge
     *
     * Sorted by lastMessageTime DESC so the frontend list is always
     * ordered by most recent (mirrors Hivegram's sort).
     */
    @Transactional
    public List<ConversationResponse> conversations(UUID userId) {

        List<Conversation> convs =
                conversationRepo.findByBuyerIdOrSellerId(userId, userId);

        return convs.stream()
                .sorted((a, b) -> b.getLastMessageTime()
                                   .compareTo(a.getLastMessageTime()))
                .map(c -> toConversationResponse(c, userId))
                .toList();
    }

    // =========================================================================
    // CREATE CONVERSATION IF NOT EXISTS  (internal helper)
    // =========================================================================

    /**
     * Finds an existing conversation between buyer and seller, or creates one.
     *
     * IDs are normalised (smaller UUID first) to prevent duplicate rows
     * regardless of which side initiates — same logic as before.
     */
    @Transactional
    public Conversation createConversationIfNotExists(UUID buyerId, UUID sellerId) {

        System.out.println("BuyerID: " + buyerId + "  SellerID: " + sellerId);

        UUID first  = buyerId.compareTo(sellerId) < 0 ? buyerId  : sellerId;
        UUID second = buyerId.compareTo(sellerId) < 0 ? sellerId : buyerId;

        return conversationRepo
                .findByBuyerIdAndSellerId(first, second)
                .orElseGet(() -> conversationRepo.save(
                        Conversation.builder()
                                .buyerId(first)
                                .sellerId(second)
                                .lastMessage("")
                                .lastMessageTime(LocalDateTime.now())
                                .buyerUnread(0)
                                .sellerUnread(0)
                                .build()
                ));
    }

    // =========================================================================
    // SAVE MESSAGE  (called by WebSocket controller on every sent message)
    // =========================================================================

    /**
     * Persists the message, updates lastMessage on the conversation,
     * increments the RECEIVER's unread counter, and returns a full
     * MessageResponse (including fileUrl if present).
     *
     * The WebSocket controller then broadcasts this response to both
     * buyerId and sellerId via convertAndSendToUser.
     */
    @Transactional
    public MessageResponse saveMessage(ConversationRequest request) {

    	
        Conversation conversation =
                createConversationIfNotExists(request.buyerId(), request.sellerId());

        // ── Persist the message ────────────────────────────────────────────
        Message msg = Message.builder()
                .conversationId(conversation.getId())
                .senderId(request.buyerId())
                .receiverId(request.sellerId())
                .message(request.message())
                .messageTime(LocalDateTime.now())
                .isReceived(false)
                .isRead(false)
                .fileUrl(request.fileUrl())           // null for text-only
                .build();

        Message saved = messageRepo.save(msg);

        // ── Update conversation metadata ───────────────────────────────────
        conversation.setLastMessage(request.message());
        conversation.setLastMessageTime(LocalDateTime.now());

        // Increment the RECEIVER's unread counter
        // (mirrors Hivegram's `unreadNumber FieldValue.increment(1)`)
        boolean senderIsBuyer = request.buyerId().equals(conversation.getBuyerId());
        if (senderIsBuyer) {
            // Seller is the receiver
            conversation.setSellerUnread(conversation.getSellerUnread() + 1);
        } else {
            // Buyer is the receiver
            conversation.setBuyerUnread(conversation.getBuyerUnread() + 1);
        }

        conversationRepo.save(conversation);

        System.out.println("Successfully saved " + saved.toString());
        
        return toMessageResponse(saved);
    }

    // =========================================================================
    // GET MESSAGES  (REST endpoint — loads history when chat screen opens)
    // =========================================================================

    @Transactional
    public List<MessageResponse> getMessages(ConversationRequest request) {

        Conversation conversation =
                createConversationIfNotExists(request.buyerId(), request.sellerId());

        List<Message> messages =
                messageRepo.findByConversationIdOrderByMessageTimeAsc(
                        conversation.getId());

        return messages.stream()
                .map(this::toMessageResponse)
                .toList();
    }

    // =========================================================================
    // MARK AS READ  (called when user opens a conversation)
    // =========================================================================

    /**
     * Resets the unread counter for `userId` in this conversation and marks
     * all messages addressed to them as isRead = true.
     *
     * Called by PUT /api/chat/conversations/{conversationId}/read?userId=...
     * Mirrors Hivegram's removeNotificationMetadata flow.
     */
    @Transactional
    public void markAsRead(UUID conversationId, UUID userId) {
        // Zero out the counter on the conversation row
        conversationRepo.resetUnreadForUser(conversationId, userId);
        // Mark individual message rows
        messageRepo.markMessagesAsRead(conversationId, userId);
    }

    // =========================================================================
    // CREATE CONVERSATION  (explicit REST endpoint, optional)
    // =========================================================================

    @Transactional
    public ConversationResponse createConversation(ConversationRequest request) {

        Conversation saved = conversationRepo.save(
                Conversation.builder()
                        .buyerId(request.buyerId())
                        .sellerId(request.sellerId())
                        .lastMessage(request.message())
                        .lastMessageTime(LocalDateTime.now())
                        .buyerUnread(0)
                        .sellerUnread(0)
                        .build()
        );

        System.out.println("Created conversation: " + saved);

        // Send the opening system message
        messageRepo.save(
                Message.builder()
                        .conversationId(saved.getId())
                        .senderId(request.buyerId())
                        .receiverId(request.sellerId())
                        .message("You can now start a conversation!")
                        .messageTime(LocalDateTime.now())
                        .isReceived(false)
                        .isRead(false)
                        .fileUrl(null)
                        .build()
        );

        // For the response, the caller is the buyer — otherUser is the seller
        // TODO: replace stub with real user lookup
        return toConversationResponse(saved, request.buyerId());
    }

    // =========================================================================
    // PRIVATE MAPPERS
    // =========================================================================

    /**
     * Maps a Conversation entity → ConversationResponse.
     *
     * `userId` is the requesting user so we can:
     *   1. Identify who the "other" participant is
     *   2. Return the correct unread count (buyer's or seller's)
     */
    private ConversationResponse toConversationResponse(Conversation c, UUID userId) {

        boolean isBuyer  = userId.equals(c.getBuyerId());
        UUID    otherId  = isBuyer ? c.getSellerId() : c.getBuyerId();
        int     unread   = isBuyer ? c.getBuyerUnread() : c.getSellerUnread();
        
        User seller = userRepo.findById(c.getSellerId()).orElseThrow(() -> new RuntimeException("Cannont find Seller"));

        User buyer = userRepo.findById(c.getBuyerId()).orElseThrow(() -> new RuntimeException("Cannont find Seller"));

        // TODO: replace stub with real user lookup
        // String otherName = userRepo.findById(otherId)
        //                            .map(User::getFullName)
        //                            .orElse("Unknown");
        String otherName = isBuyer ? seller.getFull_name() : buyer.getFull_name(); // stub

        String profile_picture = isBuyer ? seller.getProfile_picture() : buyer.getProfile_picture(); 
        
        return new ConversationResponse(
                c.getId(),
                c.getBuyerId(),
                c.getSellerId(),
                profile_picture,
                c.getLastMessage(),
                c.getLastMessageTime(),                
                otherName,
                otherId,
                unread
        );
    }

    /** Maps a Message entity → MessageResponse (includes fileUrl). */
    private MessageResponse toMessageResponse(Message m) {
        return new MessageResponse(
                m.getConversationId(),
                m.getSenderId(),
                m.getReceiverId(),
                m.getMessage(),
                m.getMessageTime(),
                m.getIsReceived(),
                m.getIsRead(),
                m.getFileUrl()          // null for text-only messages
        );
    }
}