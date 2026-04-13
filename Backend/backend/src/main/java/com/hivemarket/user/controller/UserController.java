package com.hivemarket.user.controller;

import java.io.IOException;


import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.hivemarket.service.CloudinaryService;
import com.hivemarket.user.dto.UserData;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;
import com.hivemarket.user.service.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
		
		private final CloudinaryService cloudinaryService;
		private final CustomUserDetails userService;
		private final UserRepository userRepo;
	
	   @PostMapping("/register/role")
	   public ResponseEntity<?> role(@RequestBody UserData clientData) throws IOException{
		   

		   
		   UserData data = UserData.builder()
				   .email(clientData.getEmail())
				   .role(clientData.getRole())
				   .build();
		   
		   userService.getUserAndUpdate(data);
		   
		   
		   System.out.println(clientData.getRole() + "Yeah this is the response");
		   
		   return ResponseEntity.ok(clientData.getRole());
		   
	   }
	   
	   @PostMapping("/register/gender")
	   public ResponseEntity<?> gender(@RequestBody UserData clientData) throws IOException{
		   
		   System.out.println("This is the gender" + clientData.getGender());
		   UserData data = UserData.builder()
				   .email(clientData.getEmail())
				   .gender(clientData.getGender())
				   .build();
		   
		   userService.getUserAndUpdate(data);
		   
		   return ResponseEntity.ok(clientData.getGender());
		   
	   }
	   
	   @PostMapping("/register/profile-picture")
	   public ResponseEntity<?> profilePicture(
			   @RequestParam MultipartFile profilePictures,
			   @RequestParam String email,
			   @RequestParam String location,
			   @RequestParam String university,
			   @RequestParam String campus
			   ) throws IOException{
		   
		   String imageUrl = cloudinaryService.uploadProfilePicture(profilePictures);
		   
		   UserData data = UserData.builder()
				   .email(email)
				   .campus(campus)
				   .location(location)
				   .unversity(university)
				   .profile_picture(imageUrl)
				   .build();
		   
		   UserData test = userService.getUserAndUpdate(data);
		   
		   System.out.println("This is the MultipartComing from the server" + data.getProfile_picture() + " email" + test.toString());
		   
		   return ResponseEntity.ok(imageUrl);
	   }
	   
	   @GetMapping("/user-data")
	   public ResponseEntity<?> getUserData(@RequestParam String email) throws IOException{
		   
		   UserData data = UserData.builder()
				   .email(email)
				   .build();
		   
		   if(!userRepo.findByEmail(email).isPresent()) {
			   throw new RuntimeException("Cannot Find Email");
		   }
		   
		   User user = userRepo.findByEmail(email).orElseThrow(
				   () -> new RuntimeException("Wrong email or cannot find emal"));
		   
		   System.out.println("This is the whole user " + user.toString());
		   
		   return ResponseEntity.ok(user);
		   
	   }
	   
	    

}
