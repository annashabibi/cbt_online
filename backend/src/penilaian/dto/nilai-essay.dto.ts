import { IsInt, Min } from 'class-validator';

export class NilaiEssayDto {
  @IsInt()
  @Min(0)
  nilai: number;
}