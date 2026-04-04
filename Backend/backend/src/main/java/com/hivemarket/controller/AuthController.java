package com.hivemarket.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hivemarket.service.JwtService;
import com.hivemarket.user.dto.LoginRequest;
import com.hivemarket.user.dto.RegisterRequest;
import com.hivemarket.user.entity.AuthResponse;
import com.hivemarket.user.service.AuthService;
import com.hivemarket.user.service.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetails userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        authService.register(request);
     
        
        
        return ResponseEntity.ok(new AuthResponse("",request.email(), ""));
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.email(),
                    request.password()
                )
            );

            String token = jwtService.generateToken(request.email());
            
            //userService.getUser(request.email());
            
            Map<String,String> response = new HashMap<>();
            response.put("token", token);
            
            String username = jwtService.extractUsername(token);
            
            System.out.println("This is the user data :" + userService.getUser(request.email()).toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}