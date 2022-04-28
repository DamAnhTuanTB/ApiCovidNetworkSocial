import { EmailExist, OldPasswordIncorrect } from './error-messages';
import { ErrorBaseDto } from './../dto/error-base.dto';
import { HttpStatus } from '@nestjs/common';

export const EMAIL_EXISTS: ErrorBaseDto = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: EmailExist,
};

export const OLD_PASSWORD_INCORRECT: ErrorBaseDto = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: OldPasswordIncorrect,
};
