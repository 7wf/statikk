import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from './user'

@Entity()
export class Project extends BaseEntity {
    /**
     * The ID of the project.
     */
    @PrimaryGeneratedColumn('uuid')
    id!: string

    /**
     * The name of the project.
     */
    @Column()
    name!: string

    /**
     * The URL to project's repository.
     */
    @Column()
    repository_url!: string

    /**
     * The owner of the project.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne((type) => User, (user) => user.projects)
    owner!: User
}
