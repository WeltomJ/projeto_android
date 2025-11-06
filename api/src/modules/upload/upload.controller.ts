import { 
    Controller, 
    Post, 
    UploadedFile, 
    UploadedFiles, 
    UseInterceptors,
    BadRequestException 
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private uploadService: UploadService) {}

    @Post('single')
    @UseInterceptors(FileInterceptor('file'))
    uploadSingle(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo foi enviado');
        }

        return {
            filename: file.filename,
            url: `${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
        };
    }

    @Post('multiple')
    @UseInterceptors(FilesInterceptor('files', 10))
    uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Nenhum arquivo foi enviado');
        }

        return files.map(file => ({
            filename: file.filename,
            url: `${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
        }));
    }
}
