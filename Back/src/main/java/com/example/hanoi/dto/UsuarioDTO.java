package com.example.hanoi.dto;

import com.example.hanoi.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nome;
    private Timestamp tempo;
    private int qtdDiscos;
    private int qtdMovimento;

    public Usuario toUsuario(){
        return new Usuario(
                this.getId(),
                this.getNome(),
                this.tempo,
                this.getQtdDiscos(),
                this.getQtdMovimento()
        );
    }

    public UsuarioDTO fromUsuario(Usuario usuario){
        return  new UsuarioDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getTempo(),
                usuario.getQtdDiscos(),
                usuario.getQtdMovimento()
        );
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
                // Converte milissegundos para minutos (1 min = 60.000 ms)
                return milissegundos / 1000.0;
            case MINUTOS:
                // Converte milissegundos para minutos (1 min = 60.000 ms)
                return milissegundos / 60000.0;
            case HORAS:
                // Converte milissegundos para horas (1 hora = 3.600.000 ms)
                return milissegundos / 3600000.0;

            default:
                throw new IllegalArgumentException("Unidade de tempo inválida: " + unidade);
        }
    }
}