package com.hivemarket.user.dto;


import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserData{
		
		UUID userId;
		
		
		String full_name;
		
		
		String email;
		
		String gender;
		
		String role;
		
		
		String unversity;
		
		
		String campus;
		
		String profile_picture;
		
		String location;
		
		
		
}
