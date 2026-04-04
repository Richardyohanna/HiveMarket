package com.hivemarket.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserData{
		
		@NotNull(message= "name cannot be null")
		String fullName;
		
		@NotNull(message= "email cannot be null")
		String email;
		
		@NotNull(message= "Specify user role please")
		String role;
		
		@NotNull(message= "unversity cannot be null")
		String unversity;
		
		String profilePicture;
		
		String location;
		
		
}
