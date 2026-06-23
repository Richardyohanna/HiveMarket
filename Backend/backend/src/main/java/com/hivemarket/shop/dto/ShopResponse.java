package com.hivemarket.shop.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.hivemarket.dto.Location;

public record ShopResponse(
        UUID shopId,
        String name,
        Location location,
        Boolean isOpen,
        LocalDateTime openTime,
        LocalDateTime closingTime,
        String image,
        double distanceKm,
        long walkTimeMinutes
) {}
