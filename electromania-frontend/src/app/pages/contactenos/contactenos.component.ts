import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-contactenos',
    standalone: true,
    imports: [TranslateModule],
    templateUrl: './contactenos.component.html',
    styleUrls: ['./contactenos.component.css']
})
export class ContactenosComponent {
    private readonly translate = inject(TranslateService);
    private readonly fallbackImage = 'https://via.placeholder.com/800x600';
    nombre = 'Ramiro Nogales';
    titulo = 'Ingeniero en Sistemas Electrónicos';
    telefono = '77436609';
    localidad = 'COCHABAMBA - BOLIVIA';
    email = 'contacto@electromania.bo';
    openWhatsApp() {
        const numeroCompleto = `+591${this.telefono}`;
        const mensaje = this.translate.instant('CONTACT.WHATSAPP_MESSAGE');
        const url = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }
    sendEmail() {
        const subject = this.translate.instant('CONTACT.EMAIL_SUBJECT');
        const body = this.translate.instant('CONTACT.EMAIL_BODY');
        globalThis.location.href = `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    onImageError(event: Event): void {
        const target = event.target as HTMLImageElement | null;
        if (!target || target.src === this.fallbackImage) {
            return;
        }
        target.src = this.fallbackImage;
    }
}