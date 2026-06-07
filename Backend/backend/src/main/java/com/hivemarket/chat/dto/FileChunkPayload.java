package com.hivemarket.chat.dto;

/**
 * One 512 KB base64 chunk of a file sent via WebSocket.
 * The frontend splits the file in HivemarketWebSocket.sendFile()
 * and publishes each chunk to /app/chat.sendFile.
 *
 * The WebSocket controller buffers chunks by
 * "buyerId_sellerId_fileName" and reassembles on the last chunk.
 */
public record FileChunkPayload(

        String buyerId,
        String sellerId,
        String fileName,
        String fileType,       // MIME type, e.g. "image/jpeg"
        long   fileSize,       // total file size in bytes
        int    chunkIndex,     // 0-based index of this chunk
        int    totalChunks,    // total number of chunks
        String chunkData       // base64-encoded chunk bytes

) {}