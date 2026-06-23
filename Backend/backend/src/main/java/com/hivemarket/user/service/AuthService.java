package com.hivemarket.user.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hivemarket.user.dto.RegisterRequest;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public void register(RegisterRequest request) {
		
		if(userRepository.findByEmail(request.email()).isPresent()) {
			
			throw new RuntimeException("Email already exits");
			
		}
		
		User user = User.builder()
				.full_name(request.fullName())
				.email(request.email())
				.password(passwordEncoder.encode(request.password()))
				.registerAt(LocalDateTime.now())
				.enabled(true)
				.build();
				
		userRepository.save(user);
	}
}