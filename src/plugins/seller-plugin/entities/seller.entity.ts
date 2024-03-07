import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    BeforeInsert
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class CustomSeller extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    shopName: string;

    @Column({ length: 100 })
    fullName: string;

    @Column({ nullable: true })
    emailAddress: string;

    @Column({ length: 15 })
    phone: string;

    @Column({ length: 20 })
    TIN: string;

    @Column({ nullable: true })
    businessRegistrationFile: string; 

    @Column({ nullable: true })
    profilePicture: string; 

    @Column({ length: 255 })
    shopAddress: string;

    @Column({ type: 'text' })
    aboutShop: string;

    @Column({ nullable: true })
    password: string;

    @Column({ default: 'pending' }) 
    status: string;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }
}
