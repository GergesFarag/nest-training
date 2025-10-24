import { Field, ObjectType } from "@nestjs/graphql";
import { ProductsGraph } from "../entities/graph-test.entity";

@ObjectType()
export class GetProductsResponseType {
  @Field(() => [ProductsGraph], { description: 'List of products' })
  data: ProductsGraph[];
  @Field(() => String, { description: 'Response message' })
  message: string;
  @Field(() => Boolean, { description: 'Response state' })  
  state: boolean;
}
