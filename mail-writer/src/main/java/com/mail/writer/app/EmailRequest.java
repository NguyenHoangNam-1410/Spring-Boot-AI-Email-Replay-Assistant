package com.mail.writer.app;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone; //Style of reply

}
