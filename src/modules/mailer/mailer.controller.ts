import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactUsDto } from './contact-us.dto';

@Controller('emails')
@ApiTags('Mailer Controller')
export class MailerController {
  private readonly logger = new Logger(MailerController.name);

  constructor(private readonly mailerService: MailerService) {}

  @Post('/contact-us')
  public async sendContactUsEmail(
    @Body() contactUsDto: ContactUsDto,
  ): Promise<void> {
    this.mailerService.sendMail({
      replyTo: contactUsDto.emailAddress,
      text: `Contact form data: \n
       First name: ${contactUsDto.firstName} \n
       Last name: ${contactUsDto.lastName} \n
       Company: ${contactUsDto.company} \n
       Email: ${contactUsDto.emailAddress} \n
       Message: ${contactUsDto.message}`,
    });
  }
}
