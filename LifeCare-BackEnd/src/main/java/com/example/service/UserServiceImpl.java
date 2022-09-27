package com.example.service;

import java.util.List;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

//import com.example.entity.Admin;
import com.example.entity.Hospital;
import com.example.entity.User;
import com.example.repository.AdminRepository;
import com.example.repository.HospitalRepository;
import com.example.repository.RequestRepository;
import com.example.repository.UserRepository;

@Service
@Transactional
public class UserServiceImpl implements UserServiceIntf{
	
	@Autowired
	AdminRepository adminRepository;
	@Autowired
	RequestRepository requestRepository;
	@Autowired
	HospitalRepository hospitalRepository;
	@Autowired
	UserRepository userRepository;
	@Autowired
	HospitalServiceIntf hospitalService;
	@Autowired
	PasswordEncoder passwordEncoder;
	
	@Autowired
	EmailService sendEmail;
	
	@Override
	public User saveUser(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		sendEmail.sendEmailForNewRegistration(user.getEmail());
		return userRepository.save(user);
	}
	
	@Override
	public List<User> getAllUser() {		
		return userRepository.findAll();
	}

	@Override
	public Hospital findAmbulanceContactById(int hospid) {		
		return hospitalRepository.findById(hospid).get();
	}

	@Override
	public Hospital findAllByHospitalId(int hospid) {		
		return hospitalRepository.findById(hospid).get();
	}

	public User findById(int id) {
		return  userRepository.findById(id).get();
	}

	@Override
	public String deleteUserDetails(int userId) {
		User user=findById(userId);
		userRepository.delete(user);
		return "User Details with Id '" + userId + "' Deleted Successfully !!!";
	}

	@Override
	public User addorUpdateUserDetails(User user) {
		return userRepository.save(user);
	}
	
	@Override
	public User fetchUserDetails(int userId) {
		return userRepository.findById(userId)
				.orElseThrow();
	}

}
