package com.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

	@Autowired
	private JavaMailSender sendMail;
	
	public void sendEmailForNewRegistration(String email) 
	{
		SimpleMailMessage message = new SimpleMailMessage();
		
		message.setFrom("15aniruddh@gmail.com");
		message.setTo(email);
		message.setSubject("Successfully Registered to LifeCare Portal");
		message.setText("Welcome to LifeCare Portal\n" + "We wish You and your Family a Great Health and Long Life");
		sendMail.send(message);
	}
	
}

