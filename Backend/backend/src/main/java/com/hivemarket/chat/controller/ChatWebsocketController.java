package com.hivemarket.chat.controller;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.hivemarket.chat.dto.ConversationRequest;
import com.hivemarket.chat.dto.FileChunkPayload;
import com.hivemarket.chat.dto.MessageResponse;
import com.hivemarket.chat.service.ChatService;

import lombok.RequiredArgsConstructor;

@Controller
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
public class ChatWebsocketController {

    private final ChatService            chatService;
    private final SimpMessagingTemplate  messagingTemplate;

    /** Destination the frontend subscribes to for incoming messages. */
    private static final String QUEUE_MESSAGES = "/hivemarket-queue/messages";

    /** Destination the frontend subscribes to for file-delivery events. */
    private static final String QUEUE_FILES    = "/hivemarket-queue/files";

    // ── In-memory chunk buffer ─────────────────────────────────────────────────
    // Key: "buyerId_sellerId_fileName"
    // Value: ordered chunk array — null slots = not yet received
    private final Map<String, byte[][]> fileBuffer = new ConcurrentHashMap<>();

    // =========================================================================
    // /app/chat.sendMessage  →  text message
    // =========================================================================
    /**
     * Receives a text message from the client, persists it (which also
     * increments the receiver's unread counter and updates lastMessage),
     * then broadcasts the saved MessageResponse back to BOTH participants.
     *
     * Mirrors Hivegram's:
     *   messagingTemplate.convertAndSendToUser(uid,      "/queue/messages", chats);
     *   messagingTemplate.convertAndSendToUser(receiverId,"/queue/messages", chats);
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ConversationRequest request, Principal principal) {

    	 System.out.println("Principal Id: " + principal.getName());
    	 System.out.println("Connected to the path /chat.sendMessage " + request);
    	 
        // Persist + get enriched response (includes fileUrl, unread update, etc.)
        MessageResponse saved = chatService.saveMessage(request);

        
        System.out.println("The chat response afte chat.sendMessage " + saved.toString());
        
        // Broadcast to sender  (so their own UI confirms delivery)
        messagingTemplate.convertAndSendToUser(
                request.buyerId().toString(),
                QUEUE_MESSAGES,
                saved
        );
        
        

        // Broadcast to receiver (drives their live subscription)
        messagingTemplate.convertAndSendToUser(
                request.sellerId().toString(),
                QUEUE_MESSAGES,
                saved
        );
    }

    // =========================================================================
    // /app/chat.sendFile  →  chunked base64 file upload
    // =========================================================================
    /**
     * Receives one 512 KB base64 chunk at a time.
     * Once ALL chunks for a given file arrive, the file is reassembled,
     * written to disk (swap this for S3/cloud storage in production),
     * saved as a message with a fileUrl, and broadcast to both participants
     * exactly like a text message.
     *
     * The frontend also receives a dedicated file-event on QUEUE_FILES so
     * the optimistic spinner bubble can be replaced with the real preview.
     */
    @MessageMapping("/chat.sendFile")
    public void receiveFileChunk(@Payload FileChunkPayload payload) throws Exception {

    	
    	System.out.println("Connected to the path /chat.senFiledMessage " + payload);
    	 
    	 
        String key = payload.buyerId() + "_" + payload.sellerId() + "_" + payload.fileName();

        // Initialise the buffer slot on the first chunk
        fileBuffer.computeIfAbsent(key, k -> new byte[payload.totalChunks()][]);

        // Decode and store this chunk
        fileBuffer.get(key)[payload.chunkIndex()] = Base64.getDecoder().decode(payload.chunkData());

        // Check if all chunks have arrived
        byte[][] chunks = fileBuffer.get(key);
        for (byte[] chunk : chunks) {
            if (chunk == null) return;   // still waiting
        }

        // ── All chunks received — reassemble ───────────────────────────────
        fileBuffer.remove(key);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        for (byte[] chunk : chunks) out.write(chunk);
        byte[] fullFile = out.toByteArray();

        // ── Persist to disk (replace with S3 upload in production) ────────
        String uploadDir    = System.getProperty("user.home") + "/hivemarket-uploads/";
        Files.createDirectories(Paths.get(uploadDir));
        String savedFileName = System.currentTimeMillis() + "_" + payload.fileName();
        Files.write(Paths.get(uploadDir + savedFileName), fullFile);

        // ── Build public URL — adjust host/port to match your deployment ──
        String fileUrl = "http://YOUR_SERVER_IP:8080/files/" + savedFileName;

        // ── Save as a message record with the file URL ─────────────────────
        ConversationRequest fileRequest = new ConversationRequest(
                UUID.fromString(payload.buyerId()),
                UUID.fromString(payload.sellerId()),
                fileUrl,      // stored as the message text as well
                fileUrl       // also stored in the dedicated fileUrl column
        );
        MessageResponse savedMessage = chatService.saveMessage(fileRequest);

        // ── Broadcast MessageResponse to both participants ──────────────────
        messagingTemplate.convertAndSendToUser(
                payload.buyerId(),
                QUEUE_MESSAGES,
                savedMessage
        );
        messagingTemplate.convertAndSendToUser(
                payload.sellerId(),
                QUEUE_MESSAGES,
                savedMessage
        );

        // ── Also send dedicated file-delivery event ────────────────────────
        // The frontend uses this to swap the optimistic spinner for the real
        // image/document preview (subscribeToFiles callback).
        Map<String, String> fileEvent = Map.of(
                "url",  fileUrl,
                "type", payload.fileType().startsWith("image") ? "image" : "document"
        );
        messagingTemplate.convertAndSendToUser(payload.buyerId(),  QUEUE_FILES, fileEvent);
        messagingTemplate.convertAndSendToUser(payload.sellerId(), QUEUE_FILES, fileEvent);
    }
}