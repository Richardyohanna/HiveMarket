package com.hivemarket.user.service;

import java.io.IOException;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.hivemarket.user.dto.UserData;
import com.hivemarket.user.dto.UserDetail;
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
	public UserData getUserAndUpdate(UserData userData) throws IOException {
		// TODO Auto-generated method stub
		
		if(!userRepository.findByEmail(userData.getEmail()).isPresent()) {
			throw new RuntimeException("Cannot find Email in Database");
		}
		
		User user = userRepository.findByEmail(userData.getEmail())
				.orElseThrow(() -> new RuntimeException("Cannot find Email in Database"));
		
		String fullName = user.getFull_name();
		String userEmail = user.getEmail();
		
		System.out.println("Hmm Role? " + userData.getRole());
		
		if (userData.getCampus() != null) {
			user.setCampus(userData.getCampus());
		}
		
		if (userData.getProfile_picture() != null) {
			user.setProfile_picture(userData.getProfile_picture());
		}
		
		if(userData.getLocation() != null) {
			user.setLocation(userData.getLocation());
		}
		
		if(userData.getRole() != null) {
			user.setRole(userData.getRole());
		}
		
		if(userData.getUnversity() != null) {
			user.setUniversity(userData.getUnversity());
		}
		
		if(userData.getGender() != null ) {
			user.setGender(userData.getGender());
		}
		
		System.out.println("This is the userData from get user and Update " + user.toString() + " Role " + userData.getRole());
		
		
		userRepository.save(user);
		
		UserData data = UserData.builder()
				.full_name(fullName)
				.email(userEmail)
				.role(user.getRole())
				.gender(user.getGender())
				.unversity(user.getUniversity())
				.campus(user.getCampus())
				.location(user.getLocation())
				.build();
		
		
		return data;
	}
	


}