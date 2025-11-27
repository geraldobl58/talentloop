import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { AuthRepository } from '../repositories/auth.repository';
import { APP_CONSTANTS, MESSAGES } from '@/libs/common/constants';

/**
 * Profile Service
 *
 * Responsabilidades:
 * - Obter perfil do usuário
 * - Upload de avatar
 * - Obter subscription
 *
 * Princípio: Single Responsibility - APENAS gerenciamento de perfil
 */
@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {
    this.setupCloudinary();
  }

  private setupCloudinary() {
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_URL');
    if (cloudinaryUrl) {
      const url = new URL(cloudinaryUrl);
      cloudinary.config({
        cloud_name: url.hostname,
        api_key: url.username,
        api_secret: url.password,
      });
    }
  }

  /**
   * Obter perfil do usuário
   */
  async getProfile(userId: string) {
    const user = await this.authRepository.getUserProfile(userId);

    if (!user) {
      throw new NotFoundException(MESSAGES.ERRORS.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Obter perfil com plano
   */
  async getProfileWithPlan(tenantId: string) {
    return this.authRepository.getSubscriptionWithPlan(tenantId);
  }

  /**
   * Upload de avatar
   */
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      const user = await this.authRepository.findUserById(userId);

      if (!user) {
        throw new NotFoundException(MESSAGES.ERRORS.USER_NOT_FOUND);
      }

      const result = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: APP_CONSTANTS.FILE_UPLOAD.CLOUDINARY_AVATAR_FOLDER,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) {
                reject(new Error(error.message));
              } else if (result) {
                resolve(result);
              } else {
                reject(new Error('Upload failed'));
              }
            },
          );

          uploadStream.end(file.buffer);
        },
      );

      await this.authRepository.updateUser(userId, {
        avatar: result.secure_url,
      });

      return result.secure_url;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `${MESSAGES.ERRORS.AVATAR_UPLOAD_FAILED}: ${error.message}`,
      );
    }
  }
}
