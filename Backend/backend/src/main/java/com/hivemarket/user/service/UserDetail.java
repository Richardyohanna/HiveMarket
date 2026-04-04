package com.hivemarket.user.service;

import java.io.IOException;

import com.hivemarket.user.dto.UserData;


public interface UserDetail {

	public UserData getUser(String email) throws IOException;
	
}
