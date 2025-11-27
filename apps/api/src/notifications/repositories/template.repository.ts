import { Injectable } from '@nestjs/common';
import * as pug from 'pug';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Template Repository
 *
 * Responsabilidades:
 * - Carregamento de templates do filesystem
 * - Cache de templates compilados
 * - Validação de existência de templates
 *
 * Princípio: Single Responsibility - APENAS gerenciamento de templates
 */
@Injectable()
export class TemplateRepository {
  private templateCache: { [key: string]: pug.compileTemplate } = {};
  private templatesDir: string;

  constructor() {
    this.templatesDir = path.join(__dirname, 'templates');
  }

  /**
   * Obter template compilado (do cache ou compilar)
   */
  getCompiledTemplate(templateName: string): pug.compileTemplate {
    if (this.templateCache[templateName]) {
      return this.templateCache[templateName];
    }

    const templatePath = path.join(this.templatesDir, `${templateName}.pug`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const compiled = pug.compileFile(templatePath, {
      pretty: false,
      cache: true,
    });

    this.templateCache[templateName] = compiled;
    return compiled;
  }

  /**
   * Verificar se template existe
   */
  templateExists(templateName: string): boolean {
    const templatePath = path.join(this.templatesDir, `${templateName}.pug`);
    return fs.existsSync(templatePath);
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.templateCache = {};
  }

  /**
   * Pré-carregar lista de templates
   */
  preloadTemplates(templateNames: string[]): void {
    templateNames.forEach((templateName) => {
      try {
        this.getCompiledTemplate(templateName);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
          `Warning: Failed to preload template ${templateName}: ${message}`,
        );
      }
    });
  }
}
