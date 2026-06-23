package com.hivemarket.utils;

public class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371;
    private static final double WALKING_SPEED_KM_H = 4.5;

    public static GeoResult calculateDistanceAndTime(
            double lat1,
            double lon1,
            double lat2,
            double lon2
    ) {

        // Haversine distance
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2)
                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2)
                        * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double distanceKm = EARTH_RADIUS_KM * c;

        // Walking time in minutes
        double timeMinutes = (distanceKm / WALKING_SPEED_KM_H) * 60;

        return new GeoResult(distanceKm, Math.round(timeMinutes));
    }

    // simple result holder
    public record GeoResult(double distanceKm, long walkTimeMinutes) {}
}