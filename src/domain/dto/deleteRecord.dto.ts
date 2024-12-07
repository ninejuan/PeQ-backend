import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteSubdomainRecordDto {
  @ApiProperty({
    description: '서브도메인 이름',
    example: 'blog',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
