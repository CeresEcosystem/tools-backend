import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactUsDto } from './contact-us.dto';

@Controller('emails')
@ApiTags('Mailer Controller')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('/contact-us')
  public sendContactUsEmail(@Body() contactUsDto: ContactUsDto): void {
    this.mailerService.sendMail({
      replyTo: contactUsDto.email,
      text: `Contact form data: \n
       Name: ${contactUsDto.name} \n
       Email: ${contactUsDto.email} \n
       Message: ${contactUsDto.message}`,
    });
  }
}
