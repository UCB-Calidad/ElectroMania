import { Directive, ElementRef, OnInit, OnDestroy, Input, inject } from '@angular/core';
@Directive({
    selector: '[appDraggableScroll]',
    standalone: true,
})
export class DraggableScrollDirective implements OnInit, OnDestroy {
    private readonly el = inject(ElementRef<HTMLElement>);
    @Input()
    scrollSpeed = 2;
    private element!: HTMLElement;
    private isDown = false;
    private startX = 0;
    private scrollLeft = 0;
    private readonly  boundMouseDown = this.onMouseDown.bind(this);
    private readonly boundMouseLeave = this.onMouseLeave.bind(this);
    private readonly boundMouseUp = this.onMouseUp.bind(this);
    private readonly boundMouseMove = this.onMouseMove.bind(this);
    private readonly boundTouchStart = this.onTouchStart.bind(this);
    private readonly boundTouchEnd = this.onTouchEnd.bind(this);
    private readonly boundTouchMove = this.onTouchMove.bind(this);
    ngOnInit() {
        this.element = this.el.nativeElement;
        this.element.style.cursor = 'grab';
        this.element.style.userSelect = 'none';
        this.element.addEventListener('mousedown', this.boundMouseDown);
        this.element.addEventListener('mouseleave', this.boundMouseLeave);
        this.element.addEventListener('mouseup', this.boundMouseUp);
        this.element.addEventListener('mousemove', this.boundMouseMove);
        this.element.addEventListener('touchstart', this.boundTouchStart);
        this.element.addEventListener('touchend', this.boundTouchEnd);
        this.element.addEventListener('touchmove', this.boundTouchMove);
    }
    ngOnDestroy() {
        this.element.removeEventListener('mousedown', this.boundMouseDown);
        this.element.removeEventListener('mouseleave', this.boundMouseLeave);
        this.element.removeEventListener('mouseup', this.boundMouseUp);
        this.element.removeEventListener('mousemove', this.boundMouseMove);
        this.element.removeEventListener('touchstart', this.boundTouchStart);
        this.element.removeEventListener('touchend', this.boundTouchEnd);
        this.element.removeEventListener('touchmove', this.boundTouchMove);
    }
    private onMouseDown(e: MouseEvent) {
        this.isDown = true;
        this.element.style.cursor = 'grabbing';
        this.startX = e.pageX - this.element.offsetLeft;
        this.scrollLeft = this.element.scrollLeft;
    }
    private onMouseLeave() {
        this.isDown = false;
        this.element.style.cursor = 'grab';
    }
    private onMouseUp() {
        this.isDown = false;
        this.element.style.cursor = 'grab';
    }
    private onMouseMove(e: MouseEvent) {
        if (!this.isDown)
            return;
        e.preventDefault();
        const x = e.pageX - this.element.offsetLeft;
        const walk = (x - this.startX) * this.scrollSpeed;
        this.element.scrollLeft = this.scrollLeft - walk;
    }
    private onTouchStart(e: TouchEvent) {
        this.isDown = true;
        this.startX = e.touches[0].pageX - this.element.offsetLeft;
        this.scrollLeft = this.element.scrollLeft;
    }
    private onTouchEnd() {
        this.isDown = false;
    }
    private onTouchMove(e: TouchEvent) {
        if (!this.isDown)
            return;
        const x = e.touches[0].pageX - this.element.offsetLeft;
        const walk = (x - this.startX) * this.scrollSpeed;
        this.element.scrollLeft = this.scrollLeft - walk;
    }
}
