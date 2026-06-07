package com.hivemarket.user.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.comment.entity.Comment;
import com.hivemarket.product.comment.entity.CommentLikes;
import com.hivemarket.reaction.entity.Reaction;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String full_name;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    @JsonIgnore
    private String password;

    @Column(name = "role")
    private String role;

    @Column(name = "gender")
    private String gender;

    @Column(name = "university")
    private String university;

    @Column(name = "campus")
    private String campus;

    @Column(name = "location")
    private String location;

    @Column(name = "profile_picture")
    private String profile_picture;
    
    @OneToMany(
    		mappedBy = "aurthor",
    		cascade = CascadeType.ALL,
    		orphanRemoval = true
    		)
    @Builder.Default
    @ToString.Exclude
    @JsonIgnore
    private List<Comment> comments = new ArrayList<>();
    
    
    @OneToMany(
	    mappedBy = "user",
	    cascade = CascadeType.ALL
	)
	@Builder.Default
	@ToString.Exclude
	@JsonIgnore
	private List<Reaction> reactions = new ArrayList<>();

    
    
    @JsonIgnore
    @OneToMany(mappedBy = "seller")
    @ToString.Exclude
    @Builder.Default
    private List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @ToString.Exclude
    @JsonIgnore
    @Builder.Default
    private List<CommentLikes> commentLikeByMe = new ArrayList<>();
    
    private boolean enabled;
    
    @Version
    private Long version;
}