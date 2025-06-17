package com.example.hanoi.service;

import com.example.hanoi.dto.UsuarioDTO;
import com.example.hanoi.entity.Usuario;
import com.example.hanoi.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    UsuarioRepository usuarioRepository;

    public List<Usuario> getAll(){
        return usuarioRepository.findAll();
    }

    public List<Usuario> getByNome(String nome){
        return usuarioRepository.findAllByNome(nome);
    }

    public Optional<UsuarioDTO> getById(Long id){
        Optional<Usuario> usuarioOptional = usuarioRepository.findById(id);
        if (usuarioOptional.isPresent()){
            UsuarioDTO usuarioDTO = new UsuarioDTO();
            return Optional.of(usuarioDTO.fromUsuario(usuarioOptional.get()));
        } else {
            return Optional.empty();
        }
    }

    public UsuarioDTO creat(UsuarioDTO usuarioDTO){
        Usuario usuario = usuarioDTO.toUsuario();
        usuario = usuarioRepository.save(usuario);
        return usuarioDTO.fromUsuario(usuario);
    }

    public boolean delete(Long id){
        if (usuarioRepository.existsById(id)){
            usuarioRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
}
