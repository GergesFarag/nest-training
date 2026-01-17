import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from '../utils/constants';
import { Review } from '../reviews/review.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({
    type: 'float',
  })
  price: number;
  @Column({
    type: 'varchar',
    length: 150,
  })
  description: string;
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

  @OneToMany(() => Review, (review) => review.product, {
    eager: false,
  })
  reviews: Review[];

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.products, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;
}
