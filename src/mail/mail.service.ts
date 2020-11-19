import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { EmailVar, MailModuleOptions } from './mail.interface';
import { CONFIG_OPTIONS } from '../common/common.constants';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    to: string,
    template: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    form.append('from', `Tae from Nuber Eats <mailgun@${this.options.domain}>`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(eVar.key, eVar.value));

    try {
      await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify your Email', email, 'verify-email', [
      { key: 'v:code', value: code },
      { key: 'v:username', value: email },
    ]);
  }
}
