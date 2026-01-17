import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { CURRENT_TIMESTAMP } from '../utils/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product) => product.reviews, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.reviews, { eager: false })
  @JoinColumn({ name: 'userId' })
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
