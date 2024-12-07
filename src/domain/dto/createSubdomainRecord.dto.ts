import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubdomainRecordDto {
  @ApiProperty({
    description: '서브도메인 이름',
    example: 'blog',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: '서브도메인은 소문자, 숫자, 하이픈만 포함할 수 있습니다',
  })
  name: string;

  @ApiProperty({
    description: '대상 IP 주소 또는 도메인',
    example: '192.168.1.1',
  })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiProperty({
    description: 'DNS 레코드 타입',
    example: 'A',
    default: 'A',
  })
  @IsString()
  @IsNotEmpty()
  type: string = 'A';

  @ApiProperty({
    description: 'Cloudflare 프록시 사용 여부',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  proxied: boolean = true;

  @ApiProperty({
    description: 'TTL (Time To Live)',
    example: 3600,
    default: 3600,
  })
  @IsOptional()
  ttl: number = 3600;
}
