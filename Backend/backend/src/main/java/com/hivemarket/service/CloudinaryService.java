package com.hivemarket.service;

import java.io.IOException;
import java.util.Map;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
	
	
	private final Cloudinary cloudinary;
	
	public String uploadImage(MultipartFile file) {
		
		try {
			Map<?,?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "hivemarket/products"));
			
			return uploadResult.get("secure_url").toString();
		} catch (IOException e) {
			throw new RuntimeException("Image upload failed", e);
		}
	}
	
	public String uploadProfilePicture(MultipartFile profilePicture) {
		
		try {
			Map<?, ?> uploadResult = cloudinary.uploader().upload(profilePicture.getBytes(), ObjectUtils.asMap("folder", "hivemarket/profilePictures"));
			
			return uploadResult.get("secure_url").toString();
		} catch (IOException e) {
			throw new RuntimeException("profile picture Upload failed", e);
		}
	}
}
