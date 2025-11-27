import { Module } from '@nestjs/common';
import { PugService } from './pug.service';
import { TemplateRenderService } from './services/template-render.service';
import { TemplateRepository } from './repositories/template.repository';

@Module({
  providers: [TemplateRepository, TemplateRenderService, PugService],
  exports: [TemplateRepository, TemplateRenderService, PugService],
})
export class NotificationsModule {}
