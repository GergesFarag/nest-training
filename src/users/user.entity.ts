import { Product } from 'src/products/product.entity';
import { Review } from 'src/reviews/review.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserType } from 'src/utils/enums';
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'varchar',
  })
  username: string;
  @Column({
    type: 'varchar',
    unique: true,
  })
  email: string;
  
  @Exclude()
  @Column({
    type: 'varchar',
  })
  password: string;

  @Column({
    default: false,
  })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.DEFAULT,
  })
  role: UserType;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  createdAt: Date;
  updatedAt: Date;
}
