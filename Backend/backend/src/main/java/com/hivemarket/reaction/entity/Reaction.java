package com.hivemarket.reaction.entity;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.user.entity.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "reaction",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {
                "product_id",
                "user_id"
            }
        )
    }
)
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "product_id",
        nullable = false
    )
    @ToString.Exclude
    @JsonIgnore
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false
    )
    @ToString.Exclude
    @JsonIgnore
    private User user;

    @Column(name = "is_reacted")
    private Boolean isReacted;
}