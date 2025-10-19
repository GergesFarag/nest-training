import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateReviewDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNotEmpty()
    content: string;
    
    @IsNumber()
    rate: number;
}