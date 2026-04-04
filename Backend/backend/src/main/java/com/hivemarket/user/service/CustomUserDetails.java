package com.hivemarket.user.service;


import java.io.IOException;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.hivemarket.user.dto.UserData;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetailsService, UserDetail{
	
		
	private final UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		// TODO Auto-generated method stub
		
		User user = userRepository.findByEmail(email)
				.orElseThrow(()-> new UsernameNotFoundException("User not found"));
		
		return org.springframework.security.core.userdetails
				.User
				.withUsername(user.getEmail())
				.password(user.getPassword())
				.build();
	}

	@Override
	public UserData getUser(String email) throws IOException {
		// TODO Auto-generated method stub
		
		if(!userRepository.findByEmail(email).isPresent()) {
			throw new RuntimeException("Cannot find Email in Database");
		}
		
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("Cannot find Email in Database"));
		
		String fullName = user.getFullName();
		String userEmail = user.getEmail();
		
		UserData data = UserData.builder()
				.fullName(fullName)
				.email(userEmail)
				.build();
		
		
		return data;
	}
	


}
