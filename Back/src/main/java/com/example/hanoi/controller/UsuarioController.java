package com.example.hanoi.controller;

import com.example.hanoi.dto.UsuarioDTO;
import com.example.hanoi.entity.Usuario;
import com.example.hanoi.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {

    @Autowired
    UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> getAll(@RequestParam(required = false) String nome){
        if (nome != null && !nome.isEmpty()){
            return usuarioService.getByNome(nome);
        }
        return usuarioService.getAll();
    }

//    @GetMapping("/{id}")
//    public ResponseEntity<UsuarioDTO> getByid(@PathVariable Long id){
//        Optional<UsuarioDTO> usuarioDTOOptional = usuarioService.getById(id);
//        if (usuarioDTOOptional.isPresent()){
//            return ResponseEntity.ok(usuarioDTOOptional.get());
//        } else {
//            return ResponseEntity.notFound().build();
//        }
//    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> create(@RequestBody UsuarioDTO usuarioDTO){
        UsuarioDTO usuarioDTOSave = usuarioService.creat(usuarioDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioDTOSave);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        if (usuarioService.delete(id)){
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
