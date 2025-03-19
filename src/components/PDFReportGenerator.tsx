import React, { useState } from 'react';
import { useEnergy } from '@/context/EnergyContext';
import { useOfficeRegistry } from '@/hooks/useOfficeRegistry';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConsumptionData, ConsumptionType } from '@/types';
import { FileText, Download, Send } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const PDFReportGenerator: React.FC = () => {
  const { currentResult, getGroupItems, companyInfo } = useEnergy();
  const { getCompanyName, getRegistryForConsumption } = useOfficeRegistry();
  const [selectedType, setSelectedType] = useState<ConsumptionType>('office');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [includeContactInfo, setIncludeContactInfo] = useState(true);
  const [includeCompanyHeader, setIncludeCompanyHeader] = useState(true);
  const [customMessage, setCustomMessage] = useState(
    'Gentile cliente,\n\nLe inviamo il dettaglio dei consumi energetici del mese corrente. Il costo è stato calcolato in base ai consumi effettivi.\n\nCordiali saluti,\nAmministrazione'
  );
  
  if (!currentResult) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Generazione Report PDF
          </CardTitle>
          <CardDescription>
            Genera report PDF per i consumi degli uffici
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-center text-muted-foreground mb-4">
            Per generare i report, effettua prima un calcolo della ripartizione.
          </p>
          <Button variant="outline" disabled>
            <FileText className="h-5 w-5 mr-2" /> Genera Report
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const getConsumptionData = () => {
    if (!currentResult) return [];
    
    const data = selectedType === 'office' 
      ? currentResult.officeData 
      : currentResult.acData;
    
    if (selectedGroup === 'all') {
      return data.filter(item => !item.isGeneral);
    }
    
    return data.filter(item => 
      item.groupId === selectedGroup && !item.isGeneral
    );
  };
  
  const generateSinglePDF = (item: ConsumptionData): jsPDF => {
    const doc = new jsPDF();
    const title = selectedType === 'office' ? 'Consumo Ufficio' : 'Consumo Aria Condizionata';
    const companyName = getCompanyName(item.id, item.type as ConsumptionType, item.name);
    const registry = getRegistryForConsumption(item.id);
    const date = format(currentResult.date, 'dd MMMM yyyy', { locale: it });
    const bill = selectedType === 'office' ? currentResult.officeBill : currentResult.acBill;
    const group = currentResult.groups?.find(g => g.id === item.groupId);
    
    let yPos = 20;
    
    if (includeCompanyHeader && companyInfo) {
      doc.setFontSize(20);
      doc.text(companyInfo.name, 105, yPos, { align: 'center' });
      yPos += 10;
      
      if (companyInfo.administrator?.name) {
        doc.setFontSize(12);
        doc.text(`Amministratore: ${companyInfo.administrator.name}`, 105, yPos, { align: 'center' });
        yPos += 8;
      }
      
      if (companyInfo.address) {
        doc.setFontSize(10);
        doc.text(companyInfo.address, 105, yPos, { align: 'center' });
        yPos += 7;
      }
      
      yPos += 5;
    } else {
      doc.setFontSize(20);
      doc.text('Ripartizione Bollette Energetiche', 105, yPos, { align: 'center' });
      yPos += 10;
    }
    
    doc.setFontSize(14);
    doc.text(`Report ${title}`, 105, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`Data: ${date}`, 105, yPos, { align: 'center' });
    yPos += 15;
    
    if (group && group.propertyType) {
      doc.setFontSize(12);
      doc.text(`Proprietà: ${group.propertyType} ${group.propertyNumber} - ${group.name}`, 20, yPos);
      yPos += 10;
    }
    
    doc.setFontSize(12);
    if (bill.providerName) {
      doc.text(`Fornitore: ${bill.providerName}`, 20, yPos);
      yPos += 7;
    }
    
    if (bill.billNumber) {
      doc.text(`Numero Bolletta: ${bill.billNumber}`, 20, yPos);
      yPos += 7;
    }
    
    doc.setFontSize(16);
    doc.text(`Utenza: ${companyName}`, 20, yPos);
    yPos += 10;
    
    if (includeContactInfo && registry) {
      doc.setFontSize(11);
      
      if (registry.isOwner !== undefined) {
        doc.text(`Tipo: ${registry.isOwner ? 'Proprietario' : 'Affittuario'}`, 20, yPos);
        yPos += 7;
      }
      
      if (registry.squareMeters) {
        doc.text(`Metri quadri: ${registry.squareMeters} m²`, 20, yPos);
        yPos += 7;
      }
      
      if (registry.thousandthQuota) {
        doc.text(`Quota millesimale: ${registry.thousandthQuota}`, 20, yPos);
        yPos += 7;
      }
      
      if (registry.contactPerson) {
        doc.text(`Persona di contatto: ${registry.contactPerson}`, 20, yPos);
        yPos += 7;
      }
      
      if (registry.email) {
        doc.text(`Email: ${registry.email}`, 20, yPos);
        yPos += 7;
      }
      
      if (registry.phone) {
        doc.text(`Telefono: ${registry.phone}`, 20, yPos);
        yPos += 7;
      }
      
      yPos += 3;
    }
    
    const splitMessage = doc.splitTextToSize(customMessage, 170);
    doc.text(splitMessage, 20, yPos);
    yPos += splitMessage.length * 7 + 10;
    
    doc.autoTable({
      startY: yPos,
      head: [['Descrizione', 'kWh', 'Costo (€)', 'Percentuale']],
      body: [
        [
          item.name,
          item.kwh.toFixed(2),
          item.cost ? item.cost.toFixed(2) : '0.00',
          item.percentage ? item.percentage.toFixed(2) + '%' : '0.00%'
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { top: 20 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFontSize(12);
    doc.text(`Totale Bolletta: ${bill.totalAmount.toFixed(2)} €`, 20, finalY);
    doc.text(`Quota a carico: ${item.cost?.toFixed(2) || '0.00'} €`, 20, finalY + 10);
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      
      if (companyInfo?.administrator?.name) {
        doc.text(
          `Gestito da: ${companyInfo.administrator.name}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 20,
          { align: 'center' }
        );
      }
      
      doc.text(
        `Pagina ${i} di ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    return doc;
  };
  
  const generateAllPDFs = () => {
    const items = getConsumptionData();
    
    if (items.length === 0) {
      toast.error('Nessun dato disponibile per il report');
      return;
    }
    
    try {
      if (items.length === 1) {
        const doc = generateSinglePDF(items[0]);
        const companyName = getCompanyName(items[0].id, items[0].type as ConsumptionType, items[0].name);
        const fileDate = format(currentResult.date, 'yyyy-MM-dd');
        doc.save(`report-consumi-${companyName.replace(/\s+/g, '-')}-${fileDate}.pdf`);
        
        toast.success('Report PDF generato con successo');
      } else {
        const mergedPdf = new jsPDF();
        let isFirst = true;
        
        items.forEach((item, index) => {
          const doc = generateSinglePDF(item);
          
          if (!isFirst) {
            for (let i = 1; i <= doc.getNumberOfPages(); i++) {
              const pageData = doc.output('arraybuffer');
              mergedPdf.addPage();
              mergedPdf.addPage();
            }
          }
          
          isFirst = false;
        });
        
        const fileDate = format(currentResult.date, 'yyyy-MM-dd');
        mergedPdf.save(`report-consumi-multipli-${fileDate}.pdf`);
        
        toast.success(`${items.length} report PDF generati con successo`);
      }
    } catch (error) {
      console.error('Errore nella generazione del PDF:', error);
      toast.error('Errore nella generazione del PDF');
    }
  };
  
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Generazione Report PDF
        </CardTitle>
        <CardDescription>
          Genera report PDF per i consumi degli uffici
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo di Consumo</Label>
            <Select 
              value={selectedType} 
              onValueChange={(value) => setSelectedType(value as ConsumptionType)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleziona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Uffici</SelectItem>
                <SelectItem value="ac">Aria Condizionata</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group">Proprietà</Label>
            <Select 
              value={selectedGroup} 
              onValueChange={setSelectedGroup}
            >
              <SelectTrigger id="group">
                <SelectValue placeholder="Seleziona proprietà" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le proprietà</SelectItem>
                {currentResult.groups?.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.propertyType ? `${group.propertyType} ${group.propertyNumber} - ${group.name}` : group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="include-contact"
              checked={includeContactInfo}
              onCheckedChange={setIncludeContactInfo}
            />
            <Label htmlFor="include-contact">
              Includi informazioni di contatto
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="include-company"
              checked={includeCompanyHeader}
              onCheckedChange={setIncludeCompanyHeader}
            />
            <Label htmlFor="include-company">
              Includi intestazione azienda/condominio
            </Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Messaggio Personalizzato</Label>
          <Textarea
            id="message"
            rows={5}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Inserisci un messaggio personalizzato per il report..."
          />
        </div>
        
        <div className="border rounded-md p-4 bg-muted/20">
          <h3 className="text-sm font-medium mb-2">Anteprima Report</h3>
          <p className="text-sm text-muted-foreground mb-2">
            I seguenti uffici/aziende saranno inclusi nel report:
          </p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {getConsumptionData().map((item) => (
              <li key={item.id}>
                {getCompanyName(item.id, item.type as ConsumptionType, item.name)} ({item.kwh.toFixed(2)} kWh, {item.cost?.toFixed(2) || '0.00'} €)
              </li>
            ))}
          </ul>
          {getConsumptionData().length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Nessun dato trovato per i criteri selezionati
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={!currentResult}>
          <Send className="h-4 w-4 mr-2" /> Invia per Email
        </Button>
        <Button 
          onClick={generateAllPDFs}
          disabled={!currentResult || getConsumptionData().length === 0}
        >
          <Download className="h-4 w-4 mr-2" /> Genera PDF
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PDFReportGenerator;
