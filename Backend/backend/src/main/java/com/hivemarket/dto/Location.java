package com.hivemarket.dto;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Embeddable
@Getter
@Setter
public class Location {

    private String address;

    private Double latitude;

    private Double longitude;
}