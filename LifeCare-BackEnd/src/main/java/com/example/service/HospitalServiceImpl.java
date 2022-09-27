package com.example.service;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.entity.Doctorinfo;
import com.example.entity.Hospital;
import com.example.repository.AdminRepository;
import com.example.repository.DoctorinfoRepository;
import com.example.repository.HospitalRepository;
import com.example.repository.UserRepository;

@Service
@Transactional
public class HospitalServiceImpl implements HospitalServiceIntf {

	@Autowired
	HospitalRepository hospitalRepository;
	@Autowired
	AdminRepository adminRepository;
	@Autowired
	UserRepository userRepository;
	@Autowired
	DoctorinfoRepository doctorinfoRepository;
	@Autowired
	PasswordEncoder passwordEncoder;
	
	
	@Override
	public Hospital savehospital(Hospital hosp) {	
		hosp.setPassword(passwordEncoder.encode(hosp.getPassword()));
		return hospitalRepository.save(hosp);
	}

	@Override
	public List<Hospital> getAllHospital() {
		return hospitalRepository.findAll();
	}
	
	@Override
	public Hospital getHospitalById(int id) {
		return hospitalRepository.findById(id).get();
	}

	@Override
	public Doctorinfo savedoctorinfo(Doctorinfo d, int id) {
		Hospital hos = hospitalRepository.findById(id).get();		
		Doctorinfo info = new Doctorinfo(d.getName(), d.getEmail(), d.getQualification(), d.getSpecialization(),hos);		
		return doctorinfoRepository.save(info);
	}

	@Override
	public void updateBed(Hospital hosp, int id) {
		hospitalRepository.updatebed(id, hosp.getVentilator(), hosp.getOxygen(), hosp.getNormal());
	}

	@Override
	public void updateBlood(Hospital h, int id) {
		hospitalRepository.updateblood(id, h.getA_pos(), h.getA_neg(), h.getB_pos(), h.getB_neg(),
				h.getAb_pos(), h.getAb_neg(), h.getO_pos(), h.getO_neg());
	}

	@Override
	public void updateOxygen(Hospital hosp,int id) {
		hospitalRepository.updateoxygen(id, hosp.getOxygenavailable());
	}

	@Override
	public Hospital getBedByHospitalname(String hosname) {
		return hospitalRepository.findByHospitalname(hosname);
	}

	@Override
	public Hospital getBloodByHospitalname(String hosname) {
		return hospitalRepository.findByHospitalname(hosname);
	}

	@Override
	public Hospital getOxygenByHospitalname(String hosname) {
		return hospitalRepository.findByHospitalname(hosname);
	}
	
	@Override
	public Hospital addorUpdateHospDetails(Hospital h) {
		return hospitalRepository.save(h);
	}

	@Override
	public Hospital fetchhospDetails(int hospid) {
		return hospitalRepository.findById(hospid)
				.orElseThrow();
	}
	
	public Hospital findById(int hospid) {
		return  hospitalRepository.findById(hospid).get();
	}

	@Override
	public String deleteHospitalDetails(int hospid) {
		Hospital h=findById(hospid);
		hospitalRepository.delete(h);
		return "User Details with Id '" + hospid + "' deleted successfully!!!";
	}
	
}
