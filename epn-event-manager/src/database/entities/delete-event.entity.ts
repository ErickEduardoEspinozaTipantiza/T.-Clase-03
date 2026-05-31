import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('delete_events')
export class DeleteEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  entity: string;

  @Column({ nullable: true })
  action: string;

  @Column({ nullable: true })
  title: string;

  // CORREGIDO: agregado campo description para consistencia con otras tablas
  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @Column({ nullable: true })
  createdAt: string;
}
