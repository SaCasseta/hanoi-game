package com.example.hanoi.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private Timestamp tempo;
    private int fase;


    public Usuario() {
    }

    public Usuario(Long id, String nome, Timestamp tempo, int fase) {
        this.id = id;
        this.nome = nome;
        this.tempo = tempo;
        this.fase = fase;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Timestamp getTempo() {
        return tempo;
    }

    public void setTempo(Timestamp tempo) {
        this.tempo = tempo;
    }

    public int getFase() {
        return fase;
    }

    public void setFase(int fase) {
        this.fase = fase;
    }
}
