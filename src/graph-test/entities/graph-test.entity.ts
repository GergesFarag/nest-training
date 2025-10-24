import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductsGraph {
  @Field(() => Int, { description: 'The unique identifier of the product' })
  id: number;

  @Field({ description: 'The name of the product' })
  title: string;

  @Field(() => Int, { description: 'The price of the product' })
  price: number;
}
