import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateReviewDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNotEmpty()
    comment: string;
    
    @IsNumber()
    rate: number;
}