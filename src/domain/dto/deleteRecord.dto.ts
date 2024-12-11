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

  @ApiProperty({
    description: '삭제할 레코드 타입',
    example: 'A',
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}
