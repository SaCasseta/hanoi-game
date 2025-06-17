package com.example.hanoi.dto;

import com.example.hanoi.entity.Usuario;
import java.sql.Timestamp;

public class UsuarioDTO {
    private Long id;
    private String nome;
    private Timestamp tempo;
    private int fase;

    public Usuario toUsuario() {
        return new Usuario(
                this.id,
                this.nome,
                this.tempo,
                this.fase
        );
    }

    public UsuarioDTO fromUsuario(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getTempo(),
                usuario.getFase()
        );
    }

    public UsuarioDTO() {
    }

    public UsuarioDTO(Long id, String nome, Timestamp tempo, int fase) {
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

    public enum UnidadeTempo {
        MINUTOS, HORAS, SEGUNDOS
    }

    public double converterTempo(UnidadeTempo unidade) {
        if (tempo == null) {
            return 0.0;
        }

        long milissegundos = tempo.getTime();

        switch (unidade) {
            case SEGUNDOS:
                return milissegundos / 1000.0;
            case MINUTOS:
                return milissegundos / 60000.0;
            case HORAS:
                return milissegundos / 3600000.0;
            default:
                throw new IllegalArgumentException("Unidade de tempo inválida: " + unidade);
        }
    }
}