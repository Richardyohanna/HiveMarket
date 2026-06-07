package com.hivemarket.chat.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hivemarket.chat.dto.ConversationResponse;
import com.hivemarket.chat.dto.MessageResponse;
import com.hivemarket.chat.dto.ConversationRequest;
import com.hivemarket.chat.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // =========================================================================
    // GET /api/chat/conversations/{userId}
    // =========================================================================
    /**
     * Returns all conversations for a user, sorted by lastMessageTime DESC.
     *
     * Each entry now includes:
     *   - otherUserName   → shown as contact fullName in the list
     *   - otherUserId     → the other participant's UUID
     *   - unreadCount     → per-row badge (buyer's or seller's counter)
     *
     * The frontend splits the result into Buying / Selling tabs using
     * buyerId === currentUserId (no extra endpoint needed).
     */
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationResponse>> getUserConversations(
            @PathVariable UUID userId
    ) {
    	
    	System.out.println("Connected to the path /conversations/{userId} " + userId);
        return ResponseEntity.ok(chatService.conversations(userId));
    }

    // =========================================================================
    // POST /api/chat/messages
    // =========================================================================
    /**
     * Fetches (or creates) the conversation between buyer and seller,
     * then returns all messages ordered by messageTime ASC.
     *
     * Called when the chat detail screen ([id].tsx) mounts.
     */
    @PostMapping("/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @RequestBody ConversationRequest request
    ) {
    	
    	System.out.println("Connected to the path /messages " + request); 
    	
    	
    	
        return ResponseEntity.ok(chatService.getMessages(request));
    }

    // =========================================================================
    // POST /api/chat/conversation
    // =========================================================================
    /**
     * Explicitly creates a new conversation (e.g. when a buyer first
     * taps "Message Seller" on a product listing).
     */
    @PostMapping("/conversation")
    public ResponseEntity<ConversationResponse> createConversation(
            @RequestBody ConversationRequest request
    ) {
    	
    	System.out.println("Connected to the path /conversation " + request); 
    	
        return ResponseEntity.ok(chatService.createConversation(request));
    }

    // =========================================================================
    // PUT /api/chat/conversations/{conversationId}/read
    // =========================================================================
    /**
     * Marks all messages in a conversation as read for the given user,
     * and resets their unread counter on the conversation row.
     *
     * Called by [id].tsx when the chat detail screen mounts (user opens chat).
     * Mirrors Hivegram's removeNotificationMetadata flow.
     *
     * Request param: userId (the person who just read the messages)
     */
    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID conversationId,
            @RequestParam  UUID userId
    ) {
    	
    	System.out.println("Connected to the path /conversations/{conversationId}/read conversationId: " + conversationId + " userId: " + userId ); 
    	
        chatService.markAsRead(conversationId, userId);
        return ResponseEntity.noContent().build();
    }
}