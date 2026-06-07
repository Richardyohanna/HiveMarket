package com.hivemarket.user.dto;

import java.io.IOException;

public interface UserDetail {

	public UserData getUserAndUpdate( UserData userData) throws IOException;
	
}
