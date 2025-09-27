import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetsEntity } from 'src/domain/entities/assets_entity';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { StoragExceptionHanler } from 'src/core/exception_handlers/storage_exception_handler';
import { Strings } from 'src/core/constants/constants';

@Injectable()
export class AssetsService {
    constructor(
        @InjectRepository(AssetsEntity)
        private assetRepository: Repository<AssetsEntity>,
    ) {}

    async uploadFile(file: Express.Multer.File, subFolder?: string): Promise<AssetsEntity> {
        try {
            var thumbnail: string | null = null;

            const result = await cloudinary.uploader.upload(file.path, {
                resource_type: file.mimetype.startsWith('video/') ? 'video' : undefined,
                public_id: file.filename,
                folder: `${Strings.appName}/${subFolder ?? ''}`,
            });

            if (file.mimetype.startsWith('video/')) {
                const html = await cloudinary.image(`${file.filename}.jpg`, {
                    resource_type: 'video',
                });

                //example response
                //`<img src='https://res.cloudinary.com/ducteonwl/video/upload/vlc-record-2025-09-20-01h48m18s-Alien%20Earth%20S01E06%20_%20PlutoMovies.com-.mp4.jpg?_a=BAMAK+LU0' />`

                const match = html.match(/<img[^>]+src=['"]([^'"]+)['"]/i);

                thumbnail = match ? match[1] : null;
            }

            return await this.assetRepository.save({
                url: result.secure_url,
                thumbnail: thumbnail ?? undefined,
                fileSize: file.size,
                mimeType: file.mimetype,
            });
        } catch (e) {
            throw StoragExceptionHanler.handleException(e);
        } finally {
            // Delete the file after upload
            const fs = await import('fs');
            fs.unlink(file.path, (err) => {
                if (err) {
                    throw StoragExceptionHanler.handleException(err);
                }
            });
        }
    }

    async deleteFile(url: string) {
        try {
            const split = url.split('/') as string[];
            const publicId = (split.pop() as string).split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        } catch (e) {
            throw StoragExceptionHanler.handleException(e);
        }
    }
}
