import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';
import { CURRENT_TIMESTAMP } from 'src/utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  rate: number;
  @Column()
  comment: string;
  @ManyToOne(() => Product, (product) => product.reviews, {
    eager: false,
    onDelete: 'CASCADE',
  })
  product: Product;
  @ManyToOne(() => User, (user) => user.reviews, { eager: false })
  user: User;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    precision: 6,
  })
  createdAt: Date;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    precision: 6,
  })
  updatedAt: Date;
}
